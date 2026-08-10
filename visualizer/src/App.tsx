import { Route, Routes } from "react-router-dom";
import { LandingLayout } from "./components/LandingLayout";
import { Gallery } from "./scenes/Gallery";
import { Visualizer } from "./scenes/Visualizer";
import { SlidePlayer } from "./scenes/SlidePlayer";
import { ContextRotProblem } from "./scenes/ContextRotProblem";
import { ContextRotSolution1 } from "./scenes/ContextRotSolution1";
import { SpecSplitTree } from "./scenes/SpecSplitTree";
import { NestedLayers } from "./scenes/NestedLayers";
import { GuidesSensorsPipeline } from "./scenes/GuidesSensorsPipeline";
import { WorkspaceWrapper } from "./scenes/WorkspaceWrapper";
import { GreenfieldIntake } from "./scenes/GreenfieldIntake";
import { usePresentationRouteSync } from "./lib/usePresentationRouteSync";

function App() {
  // Keeps this window's route in lockstep with its Presenter/Audience counterpart —
  // see usePresentationRouteSync for how; beat-level sync (within a scene) lives in
  // useBeats instead, since that state never reaches the URL.
  usePresentationRouteSync();

  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<Gallery />} />
        <Route path="/visualizer" element={<Visualizer />} />
      </Route>
      <Route path="/deck/:id" element={<SlidePlayer />} />
      <Route path="/context-rot-problem" element={<ContextRotProblem />} />
      <Route path="/context-rot-solution-1" element={<ContextRotSolution1 />} />
      <Route path="/progressive-disclosure" element={<SpecSplitTree />} />
      <Route path="/nested-layers" element={<NestedLayers />} />
      <Route path="/guides-sensors" element={<GuidesSensorsPipeline />} />
      <Route path="/workspace-wrapper" element={<WorkspaceWrapper />} />
      <Route path="/input-collection-gate" element={<GreenfieldIntake />} />
    </Routes>
  );
}

export default App;
