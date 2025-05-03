def clean_swar(predictions):
    for subgroup, contents in predictions.items():
        for key in ('kann_swar', 'swar'):
            cleaned = []
            for layer in contents.get(key, []):
                # layer is a list of strings, e.g. ["a_s", "b_s"]
                cleaned_layer = [s.replace('_', '') for s in layer]
                cleaned.append(cleaned_layer)
            contents[key] = cleaned
    return predictions