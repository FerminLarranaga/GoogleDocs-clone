import TextEditor from './TextEditor.js';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import {v4 as uuidV4} from 'uuid';

function App() {
  return (
    <Router>
      <Switch>
        {/* When the page is loaded, redirect to the path /documents/ and randomly generate an id */}
        <Route path='/' exact>
          <Redirect to ={`/documents/${uuidV4()}`} />
        </Route>
        {/* If the path is /documents/ and something here (id), then, render the TextEditor component*/}
        <Route path='/documents/:id'>
          <TextEditor />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
