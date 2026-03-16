import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import  ApproveHub  from './components/ApproveHub';

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <ApproveHub />
    </FluentProvider>
  );
}

export default App;
