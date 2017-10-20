/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Router from 'universal-router';
import { graphql } from 'relay-runtime';

// The list of all application routes where each route contains a URL path string (pattern),
// the list of components to load asynchronously (chunks), data requirements (GraphQL query),
// and a render() function which shapes the result to be passed into the top-level (App) component.
// For more information visit https://github.com/kriasoft/universal-router
const routes = [
  {
    path: '/',
    query: graphql`query routerHomeQuery {
      allWorkflows(first: 50) { ...Home_workflows }
    }`, // prettier-ignore
    components: () => [import(/* webpackChunkName: 'home' */ './Home')],
    render: ([Home], data) => ({
      title: 'Home page',
      body: <Home workflows={data.allWorkflows} />,
    }),
  },
  {
    path: '/error',
    components: () => [import(/* webpackChunkName: 'main' */ './ErrorPage')],
    render: ([ErrorPage]) => ({
      title: 'Error',
      body: <ErrorPage />,
    }),
  },
  {
    path: '/workflow-:id',
    query: graphql`query routerWorkflowQuery($id: ID!) {
      workflow: node(id: $id) { ...Workflow_workflow }
    }`, // prettier-ignore
    components: () => [import(/* webpackChunkName: 'home' */ './Workflow')],
    render: ([Workflow], data) => ({
      title: data.title,
      body: <Workflow workflow={data.workflow} />,
    }),
  },
  {
    path: '/tasks/:status(pending|completed)?',
    components: () => [import(/* webpackChunkName: 'home' */ './Home')],
    render: ([Home]) => ({
      title: 'Untitled Page',
      body: <Home />,
    }),
  },
  {
    path: '/workflows',
    query: graphql`query routerWorkflowsQuery {
      allWorkflows(first: 50) { ...Workflows_workflows }
    }`, // prettier-ignore
    components: () => [import(/* webpackChunkName: 'home' */ './Workflows')],
    render: ([Workflows], data) => ({
      title: 'Workflows page',
      body: <Workflows workflows={data.allWorkflows} />,
    }),
  },
];

function resolveRoute({ route, fetch, next }, params) {
  // Skip routes that have no .render() method
  if (!route.render) return next();

  // Shape the result to be passed into the top-level React component (App)
  return {
    params,
    query: route.query,
    variables:
      typeof route.variables === 'function'
        ? route.variables(params)
        : { ...params },
    components:
      typeof route.components === 'function'
        ? Promise.all(
            route.components().map(promise => promise.then(x => x.default)),
          ).then(components => (route.components = components))
        : route.components,
    render: route.render,
  };
}

export default new Router(routes, { resolveRoute });
