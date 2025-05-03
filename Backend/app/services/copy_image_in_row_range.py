import os, re, shutil

def get_image_details_with_row(filename):
    pattern = r'(\d+)_row(\d+)_x(\d+)_y(\d+)_w(\d+)_h(\d+)'
    match = re.match(pattern, filename)
    if match:
        page_num = int(match.group(1))
        row_num = int(match.group(2))
        x = int(match.group(3))
        y = int(match.group(4))
        w = int(match.group(5))
        h = int(match.group(6))
        return (page_num, row_num, x, y, w, h)
    return None

def copy_images_in_row_range(input_folder, output_folder, first_row, last_row):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for filename in os.listdir(input_folder):
        details = get_image_details_with_row(filename)
        if details:
            _, row_num, _, _, _, _ = details
            if first_row <= row_num <= last_row:
                shutil.copy(os.path.join(input_folder, filename), os.path.join(output_folder, filename))
