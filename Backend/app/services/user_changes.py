def user_changes(original, updated):
    original_set = set(original)
    updated_set = set(updated)
    return len(updated_set - original_set) + len(original_set - updated_set)


def count_nested_changes(original, updated):
    total_changes = 0

    for subgroup_key in original:
        for attr_key in original[subgroup_key]:
            orig_attr = original[subgroup_key][attr_key]
            updated_attr = updated.get(subgroup_key, {}).get(attr_key, [])

            # Check if it's a list of lists
            if isinstance(orig_attr, list) and all(isinstance(x, list) for x in orig_attr):
                for orig_list, upd_list in zip(orig_attr, updated_attr):
                    removed = set(orig_list) - set(upd_list)
                    added = set(upd_list) - set(orig_list)
                    total_changes += len(removed) + len(added)

            # Check if it's a list of strings
            elif isinstance(orig_attr, list) and all(isinstance(x, str) for x in orig_attr):
                for o, u in zip(orig_attr, updated_attr):
                    if o != u:
                        total_changes += 1

    return total_changes
