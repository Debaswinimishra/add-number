import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import NotFoundPage from "./components/NotFound";
import TopNavMenu from "./components/TopNavMenu";
import HomePage from "./pages/HomePage";
import BlockWiseGroupFetch from "./pages/BlockWiseGroupFetch";
import BlockWiseNumberAdd from "./pages/BlockWiseNumberAdd";
import CreateTemplate from "./pages/CreateTemplate";
import MediaUpload from "./pages/MediaUpload";
import SendMessage from "./pages/SendMessage";
import UnMatchedGroups from "./pages/UnMatchedGroups";

const App = () => {
  return (
    <>
      <Router>
        <TopNavMenu />
        <Routes>
          <Route path="/HomePage" element={<HomePage />} />
          <Route
            path="/BlockWiseGroupFetch"
            element={<BlockWiseGroupFetch />}
          />
          <Route path="/BlockWiseNumberAdd" element={<BlockWiseNumberAdd />} />
          <Route path="/UnMatchedGroups" element={<UnMatchedGroups />} />
          <Route path="/CreateTemplate" element={<CreateTemplate />} />
          <Route path="/MediaUpload" element={<MediaUpload />} />
          <Route path="/SendMessage" element={<SendMessage />} />
          <Route path="/" element={<Navigate to="/HomePage" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
