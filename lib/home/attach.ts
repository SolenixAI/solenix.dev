// Attaches the homepage to the site's one 3D world (lib/space/world.ts). Called when the homepage mounts
// (components/home/binding.tsx). The function it returns runs when the homepage unmounts: every listener, observer,
// timer and race the homepage started is stopped, and the world is unbound. The world is not stopped for good; it
// only stops drawing while no page is bound to it.
import { spaceWorld } from "@/lib/space/world";
import { startRaces } from "./races";
import { startScene } from "./scene";
import { startUi } from "./ui";

export function attachHome(): () => void {
  const ui = startUi();
  const stopRaces = startRaces();
  const scene = startScene(ui.S);
  spaceWorld.bind(scene.binding);
  return () => {
    spaceWorld.unbind(scene.binding);
    scene.stop();
    stopRaces();
    ui.stop();
  };
}
