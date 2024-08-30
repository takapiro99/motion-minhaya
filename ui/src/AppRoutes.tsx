import { createBrowserRouter } from "react-router-dom";
import { TopPage } from "./components/page/TopPage";
import { GamePage } from "./components/page/GamePage";
import { CreateQuizPage } from "./components/page/CreateQuizPage";
import { RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <TopPage />,
  },
  {
    path: "/game",
    element: <GamePage />,
  },
  {
    path: "/create-quiz",
    element: <CreateQuizPage />,
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};
