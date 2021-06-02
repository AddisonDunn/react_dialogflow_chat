import './App.css';
import MainPage from './pages/MainPage'
import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";

const theme = createMuiTheme({
  palette: {
    background: {
      default: "#333333"
    },
    primary: {
      main: "#007bff",
    },
    secondary: {
      main: '#ffffff',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#ffcc00',
    },
  },
  typography: {
    fontSize: 12,
    h3: {

    }
  },
});

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MainPage />
      </ThemeProvider>
    </div>
  );
}

export default App;
