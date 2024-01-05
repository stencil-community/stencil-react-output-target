import './App.css';
import { MyButton, MyComponent } from './components/react-components';

function App() {
  return (
    <>
      <MyComponent first="John" last="Doe" />
      <MyButton
        onStencilComplexClick={(ev) => {
          // This event is not actually emitted by the component
          console.log('complex click', ev.detail);
        }}
        onStencilClick={(res) => console.log('hello', res.detail.data)}
      >
        Click me
      </MyButton>
    </>
  );
}

export default App;
