import { useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import Routes from 'routes';
// defaultTheme
import themes from 'themes';
// project imports
import NavigationScroll from 'layout/NavigationScroll';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const customization = useSelector((state) => state.customization);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <ToastContainer />
        <CssBaseline />
        <NavigationScroll>
          <Routes />
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
