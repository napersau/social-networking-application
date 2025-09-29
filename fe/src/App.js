import { useRoutes } from "react-router-dom";
import routes from "./routes";
import './App.css';
import { OnlineUsersProvider } from "./context/OnlineUsersContext";

function App() {
  const element = useRoutes(routes);

  return (
    <OnlineUsersProvider>
      {element}
    </OnlineUsersProvider>
  );
}

export default App;
