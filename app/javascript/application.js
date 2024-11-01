// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails";
import morphdom from "morphdom";

let prevPath = window.location.pathname;

document.addEventListener("turbo:before-render", (event) => {
  Turbo.navigator.currentVisit.scrolled = prevPath === window.location.pathname;
  prevPath = window.location.pathname;

  event.detail.render = async (prevEl, newEl) => {
    await new Promise((resolve) => setTimeout(() => resolve(), 0));

    morphdom(prevEl, newEl, {
      onBeforeNodeAdded: function(node) {
        // Do not add/discard permanent nodes when the page is
        // rendered from the cache, as the cache may contain a
        // stale version of the node.
        //
        // For example, when we start to play a new track, the
        // cache will contain the previous one. So, Turbo will
        // remove the current track and replace it with the
        // previous one while rendering the cached version.
        // Then, it will swap the tracks again when it renders
        // the actual verion of the page.
        if (
          node && node.hasAttribute &&
          node.hasAttribute("data-turbo-morph-permanent") &&
          document.documentElement.hasAttribute("data-turbo-preview")
        ) {
          return false;
        }

        return node;
      },
      onBeforeElUpdated: function(fromEl, toEl) {
        if (fromEl.hasAttribute("data-turbo-morph-permanent")) {
          return false;
        }

        if (fromEl.isEqualNode(toEl)) {
          return false;
        }

        return true;
      },
      onBeforeNodeDiscarded: function(node) {
        if (
          node && node.hasAttribute &&
          node.hasAttribute("data-turbo-morph-permanent") &&
          document.documentElement.hasAttribute("data-turbo-preview")
        ) {
          return false;
        }

        return true;
      },
    });
  };

  if (document.startViewTransition) {
    event.preventDefault();

    document.startViewTransition(() => {
      event.detail.resume();
    });
  }
});

document.addEventListener("turbo:before-frame-render", (event) => {
  event.detail.render = (currentElement, newElement) => {
    if (
      currentElement.hasAttribute("transition-name") &&
      newElement.hasAttribute("transition-name") &&
      currentElement.firstElementChild?.getAttribute("transition-id") !==
        newElement.firstElementChild?.getAttribute("transition-id")
    ) {
      document.documentElement.setAttribute(
        "transition",
        currentElement.getAttribute("transition-name")
      );
    }

    morphdom(currentElement, newElement, {
      childrenOnly: true,
    });
  };

  if (document.startViewTransition) {
    event.preventDefault();

    document
      .startViewTransition(() => {
        event.detail.resume();
      })
      .finished.then(() => {
        document.documentElement.removeAttribute("transition");
      });
  }
});
