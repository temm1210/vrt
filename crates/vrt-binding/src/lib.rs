use napi_derive::napi;

#[napi]
pub fn add(left: u32, right: u32) -> u32 {
    vrt_core::add(left, right)
}
