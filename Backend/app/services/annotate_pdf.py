
# import os
# import cv2
# import fitz
# import numpy as np
# import os.path
# import sys
# from app.services.save_data import load_rows_from_file
# sys.path.append(os.path.join(os.path.dirname(__file__)))


# def annotate_pdf_rows(pdf_path, all_row_mappings, all_coordinates, output_folder):
#     """
#     Annotate PDF pages with row contours and numbers with improved text placement.
#     All row images will have the same horizontal length while preserving original text alignment.
    
#     Articulation - (0, 0, 0)
#     Kann-Swar - (0, 0, 255)
#     Swar - (0, 255, 0)
#     lyrics - (255, 0, 0)
#     None - (128, 128, 128)
    
#     Parameters:
#     - pdf_path: Path to the PDF file
#     - all_row_mappings: List of row mappings for each page from extract_alphabets
#     - all_coordinates: List of coordinates for each page from extract_alphabets
#     - output_folder: Folder to save annotated images
#     """
    
#     if not os.path.exists(output_folder):
#         os.makedirs(output_folder)

#     pdf_document = fitz.open(pdf_path)
    
#     # First pass: Find the maximum width among all rows in all pages
#     # and the leftmost starting point to maintain alignment
#     max_width = 0
#     global_min_x = float('inf')
    
#     for page_num in range(len(pdf_document)):
#         # Skip pages with no coordinates or mappings
#         if page_num >= len(all_coordinates) or not all_coordinates[page_num] or not all_row_mappings[page_num]:
#             continue
        
#         # Get row mapping and coordinates for the current page
#         coordinates = all_coordinates[page_num]
        
#         # Find global minimum x across all pages to maintain alignment
#         page_min_x = min([x for x, _, _, _ in coordinates], default=float('inf'))
#         global_min_x = min(global_min_x, page_min_x)
        
#         # Find global maximum width (right edge - left edge)
#         page_max_x = max([x + w for x, _, w, _ in coordinates], default=0)
#         page_width = page_max_x - page_min_x
#         max_width = max(max_width, page_width)
    
#     # Add some padding to max_width
#     max_width += 20  # Add padding
    
#     # Second pass: Extract and save rows with consistent width and aligned content
#     for page_num in range(len(pdf_document)):
#         # Skip pages with no coordinates or mappings
#         if page_num >= len(all_coordinates) or not all_coordinates[page_num] or not all_row_mappings[page_num]:
#             continue
        
#         # Get page image
#         page = pdf_document.load_page(page_num)
#         page_image = page.get_pixmap()
#         np_page_image = np.frombuffer(page_image.samples, dtype=np.uint8).reshape(
#             (page_image.height, page_image.width, page_image.n)
#         )
        
#         # Create a copy for annotation
#         annotated_image = np_page_image.copy()
        
#         # Get row mapping and coordinates for the current page
#         row_mapping = all_row_mappings[page_num]
#         coordinates = all_coordinates[page_num]
        
#         # Process each row in the current page
#         for num, lower_limit, upper_limit in row_mapping:
#             # Find all coordinates in this row
#             row_coords = [
#                 (x, y, w, h) for x, y, w, h in coordinates
#                 if lower_limit <= y <= upper_limit
#             ]
            
#             if row_coords:
#                 # Find row boundaries
#                 min_x = min(x for x, _, _, _ in row_coords)
#                 max_x = max(x + w for x, _, w, _ in row_coords)
                
#                 # Calculate height of row
#                 row_height = upper_limit - lower_limit
                
#                 # Ensure we don't go out of image bounds for height
#                 lower_bound = max(0, lower_limit - 2)
#                 upper_bound = min(annotated_image.shape[0], upper_limit + 6)
                
#                 # Calculate left boundary to maintain original text alignment
#                 # Use the same starting point (relative to global_min_x) for all rows
#                 offset_from_global = max(0, min_x - global_min_x)
#                 left_bound = max(0, min_x - offset_from_global)
                
#                 # Right boundary is left_bound + max_width, but don't exceed image width
#                 right_bound = min(annotated_image.shape[1], left_bound + max_width)
                
#                 # If we hit the right edge of the image, adjust left_bound to ensure max_width
#                 if right_bound - left_bound < max_width and left_bound > 0:
#                     adjustment = min(left_bound, max_width - (right_bound - left_bound))
#                     left_bound = max(0, left_bound - adjustment)
                
#                 # Extract row image
#                 row_image = annotated_image[lower_bound:upper_bound, left_bound:right_bound]
                
#                 # If the row image is still narrower than max_width, pad it on the right
#                 if row_image.shape[1] < max_width:
#                     # Create blank image with the height of row_image and max_width
#                     padded_image = np.ones((row_image.shape[0], max_width, row_image.shape[2]), dtype=np.uint8) * 255
                    
#                     # Copy the row image into the padded image (aligned to the left)
#                     padded_image[:, :row_image.shape[1]] = row_image
#                     row_image = padded_image
                
#                 # Save row image
#                 try:
#                     rows = load_rows_from_file("rows")
#                 except Exception as e:
#                     print(f"Error loading rows: {str(e)}")
                
#                 row_image_filename = os.path.join(output_folder, f"row_{page_num+1}_R{num}.png")
#                 cv2.imwrite(row_image_filename, cv2.cvtColor(row_image, cv2.COLOR_RGB2BGR))
                
#                 # Add row number text
#                 text = f"R{num}"
#                 text_x = max(0, min_x - 30)  # Fixed position from left margin
#                 text_y = lower_limit + (row_height // 2) + 3  # Vertically centered
                
#                 # Add white background for text to improve visibility
#                 (text_width, text_height), _ = cv2.getTextSize(
#                     text, 
#                     cv2.FONT_HERSHEY_SIMPLEX, 
#                     0.35,  # Slightly smaller font
#                     1
#                 )
                
#                 # Ensure text background is within image bounds
#                 if (text_x - 2 >= 0 and text_y - text_height - 2 >= 0 and 
#                     text_x + text_width + 2 < annotated_image.shape[1] and 
#                     text_y + 2 < annotated_image.shape[0]):
                    
#                     # Draw text background
#                     cv2.rectangle(
#                         annotated_image,
#                         (text_x - 2, text_y - text_height - 2),
#                         (text_x + text_width + 2, text_y + 2),
#                         (255, 255, 255),  # White background
#                         -1  # Filled rectangle
#                     )
                    
#                     # Draw text
#                     cv2.putText(
#                         annotated_image,
#                         text,
#                         (text_x, text_y),
#                         cv2.FONT_HERSHEY_SIMPLEX,
#                         0.35,  # Font size
#                         (0, 0, 255),  # Red color
#                         1,
#                         cv2.LINE_AA  # Anti-aliased text
#                     )
    
#     print(f"Annotated pages saved to {output_folder}")


import os
import cv2
import fitz
import numpy as np
from PIL import Image
import os.path
import sys
from app.services.save_data import load_rows_from_file
sys.path.append(os.path.join(os.path.dirname(__file__)))

def annotate_pdf_rows(pdf_path, all_row_mappings, all_coordinates, output_folder, padding=10):
    """
    Extract rows from PDF pages and save them as images.
    
    Parameters:
    - pdf_path: Path to the PDF file
    - all_row_mappings: List of row mappings for each page
    - all_coordinates: List of coordinates for each page
    - output_folder: Folder to save row images
    - padding: Padding to add to each row image (default: 10)
    """
    
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    pdf_document = fitz.open(pdf_path)
    
    for page_num in range(len(pdf_document)):
        # Skip pages with no row mappings
        if page_num >= len(all_row_mappings) or not all_row_mappings[page_num]:
            continue
        
        # Get page image
        page = pdf_document.load_page(page_num)
        page_image = page.get_pixmap()
        np_page_image = np.frombuffer(page_image.samples, dtype=np.uint8).reshape(
            (page_image.height, page_image.width, page_image.n)
        )
        
        # Get row mapping for the current page
        row_mapping = all_row_mappings[page_num]
        
        # Sort row_mapping by lower_limit to ensure proper order
        row_mapping = sorted(row_mapping, key=lambda x: x[1])
        
        for i, (row_num, lower_limit, upper_limit) in enumerate(row_mapping):
            # Calculate the height of the row
            row_height = upper_limit - lower_limit
            
            # Calculate the ending y coordinate
            end_y = lower_limit + 2 * row_height
            
            # Ensure the end_y does not exceed the image height
            end_y = min(end_y, np_page_image.shape[0])
            
            # Check if the next row exists and adjust end_y to avoid overlap
            if i < len(row_mapping) - 1:
                next_lower_limit = row_mapping[i + 1][1]
                next_upper_limit = row_mapping[i + 1][2]
                if end_y > next_lower_limit and next_upper_limit - next_lower_limit > 1:
                    end_y = next_lower_limit
            
            # Skip if the row is empty or invalid
            if lower_limit >= end_y:
                print(f"Skipping empty row {row_num}: lower_limit ({lower_limit}) >= end_y ({end_y})")
                continue
            
            # Extract the row from the page image
            row_image = np_page_image[lower_limit:end_y, :]
            
            # Convert RGB to grayscale if necessary
            if len(row_image.shape) == 3:  # If RGB, convert to grayscale
                row_image = cv2.cvtColor(row_image, cv2.COLOR_RGB2GRAY)
            
            # Ensure the image is 2D (grayscale)
            if len(row_image.shape) != 2:
                print(f"Unexpected image shape: {row_image.shape}, skipping row {row_num}")
                continue
            
            # Add padding to the row image
            padded_row_image = np.pad(row_image, ((padding, padding), (0, 0)), mode='constant', constant_values=255)
            
            # Convert to PIL image
            pil_row_image = Image.fromarray(padded_row_image)
            
            # Save the row image
            row_image_filename = os.path.join(output_folder, f"row_{page_num+1}_R{row_num}.png")
            pil_row_image.save(row_image_filename)
            
            print(f"Saved row {row_num} from page {page_num+1} to {row_image_filename}")
    
    print(f"Extracted rows saved to {output_folder}")