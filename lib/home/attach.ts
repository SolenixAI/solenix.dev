// Attaches the homepage to the site's one 3D world (lib/space/world.ts). Called when the homepage mounts
// (components/home/binding.tsx). The function it returns runs when the homepage unmounts: every listener, observer
// and timer the homepage started is stopped, and the world is unbound. The world is not stopped for good; it
// only stops drawing while no page is bound to it.
import { spaceWorld } from "@/lib/space/world";
import { startScene } from "./scene";
import { startStepper } from "./stepper";
import { startTools } from "./tools";
import { startUi } from "./ui";

export function attachHome(): () => void {
  const ui = startUi();
  const stopTools = startTools(ui.S);
  const scene = startScene(ui.S);
  const stopStepper = startStepper(matchMedia("(prefers-reduced-motion: reduce)"));
  spaceWorld.bind(scene.binding);
  return () => {
    spaceWorld.unbind(scene.binding);
    stopStepper();
    scene.stop();
    stopTools();
    ui.stop();
  };
}
