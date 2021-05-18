import './App.css';
import MainPage from './pages/MainPage'
import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from "@material-ui/core";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#007bff",
    },
    secondary: {
      main: '#0044ff',
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
        <MainPage />
      </ThemeProvider>
    </div>
  );
}

export default App;
