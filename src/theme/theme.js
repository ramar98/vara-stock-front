import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#111111",
      light: "#343434",
      dark: "#000000",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#B4A89A",
      light: "#D8D0C7",
      dark: "#786E63",
      contrastText: "#111111",
    },

    background: {
      default: "#F7F4EF",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#171717",
      secondary: "#716A63",
    },

    divider: "#E7E2DA",

    success: {
      main: "#536B57",
    },

    warning: {
      main: "#A9783A",
    },

    error: {
      main: "#A94A45",
    },

    info: {
      main: "#5F7181",
    },
  },

  typography: {
    fontFamily:
      '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',

    h4: {
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.01em",
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F7F4EF",
        },

        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "#CFC7BD transparent",
        },

        "*::-webkit-scrollbar": {
          width: 8,
          height: 8,
        },

        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#CFC7BD",
          borderRadius: 8,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 10,
          paddingLeft: 18,
          paddingRight: 18,
          boxShadow: "none",
        },

        containedPrimary: {
          backgroundColor: "#111111",

          "&:hover": {
            backgroundColor: "#2B2B2B",
            boxShadow:
              "0 8px 18px rgba(17, 17, 17, 0.18)",
          },
        },

        outlinedPrimary: {
          borderColor: "#BFB6AC",
          color: "#171717",

          "&:hover": {
            borderColor: "#111111",
            backgroundColor: "#F1EDE7",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E7E2DA",
          boxShadow:
            "0 8px 28px rgba(41, 36, 31, 0.05)",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#9E958B",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#111111",
            borderWidth: 1.5,
          },
        },

        notchedOutline: {
          borderColor: "#D8D1C8",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#716A63",

          "&.Mui-focused": {
            color: "#111111",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 0,
          backgroundColor: "#FFFFFF",
        },

        columnHeaders: {
          backgroundColor: "#F1EDE7",
          color: "#312D29",
          borderBottom: "1px solid #DED7CE",
        },

        columnHeaderTitle: {
          fontWeight: 700,
        },

        row: {
          "&:hover": {
            backgroundColor: "#FAF8F5",
          },
        },

        cell: {
          borderColor: "#EEEAE4",
        },

        footerContainer: {
          borderTop: "1px solid #E7E2DA",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          border: "1px solid #E7E2DA",
          boxShadow:
            "0 24px 70px rgba(35, 30, 25, 0.16)",
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#111111",
          height: 3,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,

          "&.Mui-selected": {
            color: "#111111",
          },
        },
      },
    },
  },
});

export default theme;