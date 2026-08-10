use xxhash_rust::xxh3::xxh3_128;

pub fn hash_bytes(data: &[u8]) -> u128 {
    xxh3_128(data)
}
