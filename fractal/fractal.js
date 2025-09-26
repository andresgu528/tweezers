import { shader } from "./shaders.js";

async function main() {
  const canvas = document.getElementById("webgpucanvas");
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    const context = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    context.fillStyle = "white";
    context.font = "18px monospace";
    context.fillText("Could not start WebGPU :(", 10, 28);
    return;
  }
  
  const context = canvas.getContext("webgpu");
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device: device,
    format: presentationFormat
  });

  const module = device.createShaderModule({
    label: "shader_module",
    code: shader
  });
  const renderPassDesc = {
    label: "render_pass",
    colorAttachments: [{
      clearValue: [0, 0, 0, 1],
      loadOp: "clear",
      storeOp: "store"
    }]
  };
  const sizeData = new Float32Array(3);
  const sizeBuffer = device.createBuffer({
    label: "size_buffer",
    size: sizeData.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  const pipeline = device.createRenderPipeline({
    label: "render_pipeline",
    layout: "auto",
    vertex: {
      module: module
    },
    fragment: {
      module: module,
      targets: [{format: presentationFormat}]
    }
  });
  const bindGroup = device.createBindGroup({
      label: "bind_group",
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {buffer: sizeBuffer}
        }
      ]
    });
  function render(time) {
    const cwidth = canvas.clientWidth;
    const cheight = canvas.clientHeight;
    canvas.width = 
        Math.max(1, Math.min(cwidth, device.limits.maxTextureDimension2D));
    canvas.height = 
      Math.max(1, Math.min(cheight, device.limits.maxTextureDimension2D));
    renderPassDesc.colorAttachments[0].view =
      context.getCurrentTexture().createView();
    //sizeData.set([canvas.width, canvas.height, Date.now/1000*2*Math.PI], 0);
    const curr = Date.now();
    sizeData.set([canvas.width, canvas.height, (time)*Math.PI/10000], 0);
    device.queue.writeBuffer(sizeBuffer, 0, sizeData);
    
    const encoder = device.createCommandEncoder({label: "command_encoder"});
    const pass = encoder.beginRenderPass(renderPassDesc);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6);
    pass.end();
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
    requestAnimationFrame(render);
  }
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const canvas = entry.target;
      const width = entry.contentBoxSize[0].inlineSize;
      const height = entry.contentBoxSize[0].blockSize;
      canvas.width = 
        Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
      canvas.height = 
        Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
    }
    render();
  });
  
  //observer.observe(canvas);
  requestAnimationFrame(render);
}

main();