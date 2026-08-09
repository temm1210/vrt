use xxhash_rust::xxh3::xxh3_128;

pub fn hash_bytes(data: &[u8]) -> u128 {
    xxh3_128(data)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn same_input_gives_same_hash() {
        assert_eq!(hash_bytes(b"vrt"), hash_bytes(b"vrt"));
    }

    #[test]
    fn one_changed_byte_changes_the_hash() {
        assert_ne!(hash_bytes(b"vrt"), hash_bytes(b"vrs"));
    }

    #[test]
    fn empty_input_is_allowed() {
        hash_bytes(b"");
    }
}
