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

function App() {
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
    </Routes>
  );
}

export default App;
