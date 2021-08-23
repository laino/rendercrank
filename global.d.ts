
// eslint-disable-next-line
declare interface KHR_parallel_shader_compile {
    // eslint-disable-next-line
    COMPLETION_STATUS_KHR: GLenum;
}

declare interface WebGLRenderingContextBase {
    getExtension(extensionName: "KHR_parallel_shader_compile"): KHR_parallel_shader_compile | null;
}
