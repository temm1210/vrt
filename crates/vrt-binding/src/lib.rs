use napi_derive::napi;

#[napi]
pub fn file_hash(path: String) -> napi::Result<String> {
    let bytes = std::fs::read(path)?;
    Ok(format!("{:016x}", vrt_core::hash::hash_bytes(&bytes)))
}
