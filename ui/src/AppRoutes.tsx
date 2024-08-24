import { createBrowserRouter } from "react-router-dom";
import { TopPage } from "./components/TopPage";
import { GamePage } from "./components/GamePage";
import { CreateQuizPage } from "./components/CreateQuizPage";
import { RouterProvider } from "react-router-dom"

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
])

export const AppRoutes = () => {
  return <RouterProvider router={router} />
}