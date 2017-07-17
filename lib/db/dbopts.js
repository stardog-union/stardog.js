// These are the Stardog DB options that I know about as of 2017-06-29.
// I got this list by running `stardog-admin metadata get <DATABASE>`

module.exports = {
  database: {
    archetypes: null,
    connection: {
      timeout: null,
    },
    creator: null,
    name: null,
    namespaces: null,
    online: null,
    time: {
      creation: null,
    },
  },
  docs: {
    default: {
      rdf: {
        extractors: null,
      },
      text: {
        extractors: null,
      },
    },
    filesystem: {
      uri: null,
    },
    path: null,
  },
  icv: {
    active: {
      graphs: null,
    },
    consistency: {
      automatic: null,
    },
    enabled: null,
    reasoning: {
      enabled: null,
    },
  },
  index: {
    differential: {
      enable: {
        limit: null,
      },
      merge: {
        limit: null,
      },
      size: null,
    },
    disk: {
      page: {
        count: {
          total: null,
          used: null,
        },
        fill: {
          ratio: null,
        },
      },
    },
    last: {
      tx: null,
    },
    literals: {
      canonical: null,
    },
    named: {
      graphs: null,
    },
    persist: null,
    size: null,
    statistics: {
      update: {
        automatic: null,
      },
    },
    type: null,
  },
  preserve: {
    bnode: {
      ids: null,
    },
  },
  progress: {
    monitor: {
      enabled: null,
    },
  },
  query: {
    all: {
      graphs: null,
    },
    plan: {
      reuse: null,
    },
    timeout: null,
  },
  reasoning: {
    approximate: null,
    classify: {
      eager: null,
    },
    consistency: {
      automatic: null,
    },
    punning: {
      enabled: null,
    },
    sameas: null,
    schema: {
      graphs: null,
      timeout: null,
    },
    type: null,
    virtual: {
      graph: {
        enabled: null,
      },
    },
  },
  search: {
    default: {
      limit: null,
    },
    enabled: null,
    index: {
      datatypes: null,
    },
    reindex: {
      tx: null,
    },
    wildcard: {
      search: {
        enabled: null,
      },
    },
  },
  security: {
    named: {
      graphs: null,
    },
  },
  spatial: {
    enabled: null,
    index: {
      version: null,
    },
    precision: null,
  },
  strict: {
    parsing: null,
  },
  transaction: {
    isolation: null,
    logging: null,
  },
  versioning: {
    directory: null,
    enabled: null,
  },
};
