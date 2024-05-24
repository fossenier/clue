foo = dict()
foo["c01_"] = 1
foo["c02_"] = 2

bar = dict()
bar["c02_"] = 3
bar["c03_"] = 4

print("Initial foo:", foo)
print("Initial bar:", bar)


def increment_key(key):
    # Split key into parts: prefix (c) and number (01_)
    prefix = key[:1]
    number = key[1:3]
    suffix = key[3:]
    incremented_number = int(number) + 1
    incremented_key = f"{prefix}{incremented_number:02d}{suffix}"
    return incremented_key


for key in foo:
    if key in bar:
        new_key = increment_key(key)
        while new_key in bar:
            new_key = increment_key(new_key)
        bar[new_key] = foo[key]
    else:
        bar[key] = foo[key]

print("Final bar:", bar)
