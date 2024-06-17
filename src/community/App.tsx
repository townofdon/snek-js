import React from "react"
import { Toaster } from "react-hot-toast"
import { QueryClient, QueryClientProvider } from "react-query"

import { Community } from "./Community"

import * as editorStyles from '../editor/Editor.css';

const queryClient = new QueryClient()

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <>
        <Community />
        <Toaster
          containerClassName={editorStyles.toastContainer}
          toastOptions={{
            duration: 10000000,
            className: editorStyles.toast,
            success: {
              duration: 5000,
              className: editorStyles.toastSuccess,
              iconTheme: {
                primary: "#111",
                secondary: "#7ad9cd",
              },
            },
            error: {
              duration: 10000000,
              className: editorStyles.toastError,
              iconTheme: {
                primary: "#111",
                secondary: "#f2805d",
              },
            },
          }}
        />
      </>
    </QueryClientProvider>
  )
}
