use crypto::digest::Digest;
use crypto::md5::Md5;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn md5(str: &str) -> String {
    let digest = md5::compute(str);
    format!("{:x}", digest)
}

#[wasm_bindgen]
pub fn ya_md5(input: &str) -> String {
    let mut hasher = Md5::new();
    hasher.input_str(input);
    hasher.result_str()
}
