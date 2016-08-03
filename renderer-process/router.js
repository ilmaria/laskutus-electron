(function () {
  const links = document.querySelectorAll('a');
  const routeCache = new Map();
  const defaultRoute = 'client-register';

  for (const link of links) {
    link.onclick = () => {
      const route = link.href.split('#')[1];
      loadRoute(route).then(renderRoute);
    };
  }

  loadRoute(defaultRoute).then(renderRoute);

  function loadRoute(route) {
    if (!routeCache.has(route)) {
      const routePromise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'import';
        link.href = `${route}/${route}.html`;
        link.onload = () => {
          resolve(link);
        };
        link.onerror = (e) => {
          reject(e);
        }
        document.head.appendChild(link);
      });
      routeCache.set(route, routePromise);
    }

    return routeCache.get(route);
  }

  function renderRoute(route) {
    const template = route.import.querySelector('template');
    const content = document.importNode(template.content, true);
    const main = document.querySelector('main');
    removeChildren(main);
    main.appendChild(content)
  }

  function removeChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }
})();
