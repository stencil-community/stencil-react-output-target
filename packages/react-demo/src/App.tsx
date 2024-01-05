import "./App.css";
import { MyButton, MyComponent } from "./components/react-components";

function App() {
  return (
    <>
      <MyComponent first="John" last="Doe" />
      <MyButton onStencilClick={(res) => console.log("hello", res.detail.data)}>
        Click me
      </MyButton>
    </>
  );
}

export default App;
