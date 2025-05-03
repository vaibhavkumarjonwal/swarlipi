import cv2
import numpy as np
import os
import fitz
from PIL import Image
from app.services.image_processing import enlarge_image, enhance_quality, preprocess_image_advanced
from app.services.mapping import create_mapping, assign_number

def extract_alphabets(pdf_path, output_folder, aspect_ratio_threshold=3):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    pdf_document = fitz.open(pdf_path)
    all_coordinates = []  # To store coordinates for all pages
    all_row_mappings = []  # To store row mappings for all pages
    last_row_number = 0  # To ensure row numbers continue across pages

    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        page_image = page.get_pixmap()
        np_page_image = np.frombuffer(page_image.samples, dtype=np.uint8).reshape((page_image.height, page_image.width, page_image.n))

        processed_image = preprocess_image_advanced(np_page_image)

        contours, _ = cv2.findContours(processed_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Extract coordinates for the current page
        coordinates = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            coordinates.append((x, y, w, h))

        if not coordinates:
            print(f"No contours found on page {page_num}.")
            all_coordinates.append([])
            all_row_mappings.append([])
            continue

        # Sort coordinates by y-axis (rows)
        coordinates_sorted_by_y = sorted(coordinates, key=lambda item: item[1])

        # Create row mapping for the current page
        row_mapping = create_mapping(coordinates_sorted_by_y, aspect_ratio_threshold, is_row=True)

        # Adjust row numbers to continue from the last row number of the previous page
        adjusted_row_mapping = []
        for num, lower_limit, upper_limit in row_mapping:
            adjusted_row_mapping.append((num + last_row_number, lower_limit, upper_limit))

        # Update last_row_number for the next page
        last_row_number = adjusted_row_mapping[-1][0] if adjusted_row_mapping else last_row_number

        # Store coordinates and row mapping for the current page
        all_coordinates.append(coordinates)
        all_row_mappings.append(adjusted_row_mapping)

        # Print row mapping and coordinates for the current page
        print(f"Page {page_num} Row Mapping:", adjusted_row_mapping)
        print(f"Page {page_num} Coordinates:", coordinates)

        # Process and save alphabet regions for the current page
        for (x, y, w, h) in coordinates:
            if h / w > aspect_ratio_threshold:
                continue

            row_num = assign_number(y, adjusted_row_mapping)

            if row_num == -1:
                continue

            alphabet_region = np_page_image[y:y+h, x:x+w]
            enlarged_region = enlarge_image(alphabet_region)
            enhanced_region = enhance_quality(enlarged_region)

            if w < 6 and h < 6:
                continue

            base_filename = f"{page_num}_row{row_num}_x{x}_y{y}_w{w}_h{h}"
            counter = 1
            filename = f"{base_filename}.png"
            while os.path.exists(os.path.join(output_folder, filename)):
                filename = f"{base_filename}_{counter}.png"
                counter += 1

            alphabet_image = Image.fromarray(enhanced_region)
            alphabet_image.save(os.path.join(output_folder, filename))
    
    return all_coordinates, all_row_mappings
