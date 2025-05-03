import json
from typing import Dict, Optional

def save_composition_metadata(
    raag_name: str,
    taal_name: str,
    lay: str,
    source_name: Optional[str] = None,
    page_number: Optional[int] = None,
    filename: str = "composition_metadata.json"
):

    """Save only basic metadata (raag, taal, lay, source)"""
    data = {
        "raag_name": raag_name,
        "taal_name": taal_name,
        "lay": lay,
        "source": {
            "name": source_name,
            "page": page_number
        } if source_name else None
    }
    
    # Remove None values
    data = {k: v for k, v in data.items() if v is not None}
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)