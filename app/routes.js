/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import FirstTimeConfigPage from './containers/FirstTimeConfigPage';
import HomePage from './containers/HomePage';
import SettingsPage from './containers/SettingsPage';

export default () => (
  <App>
    <Switch>
      <Route path="/home" component={HomePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/first-time-config" component={FirstTimeConfigPage} />
    </Switch>
  </App>
);
