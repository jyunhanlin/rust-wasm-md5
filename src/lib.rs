use crypto::digest::Digest;
use crypto::md5::Md5;
use wasm_bindgen::prelude::*;
// use web_sys::console;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// This is like the `main` function, except for JavaScript.
// #[wasm_bindgen(start)]
// pub fn main_js() -> Result<(), JsValue> {
//     // This provides better error messages in debug mode.
//     // It's disabled in release mode so it doesn't bloat up the file size.
//     #[cfg(debug_assertions)]
//     console_error_panic_hook::set_once();

//     // Your code goes here!
//     console::log_1(&JsValue::from_str("Hello world!"));

//     Ok(())
// }

#[wasm_bindgen]
pub fn digest(str: &str) -> String {
    let digest = md5::compute(str);
    let res = format!("{:x}", digest);
    return res;
}

#[wasm_bindgen]
pub fn md5(input: &str) -> String {
    let mut hasher = Md5::new();
    hasher.input_str(input);
    hasher.result_str()
}
