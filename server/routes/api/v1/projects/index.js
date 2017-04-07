/**
 * Created by zhangsihao on 17-3-24.
 */
const Router = require('koa-router');
const router = new Router();
const path = require('path');

module.exports = router;

/**
 * 获取项目列表
 */
router.get('/', async function (ctx) {
  try {
    const result = await ctx.etcd.get(path.join('/', ctx.config.namespace));
    const projects = [];
    result.node.nodes.forEach((node) => {
      projects.push({
        name: node.key.substr(path.join('/', ctx.config.namespace, '/').length),
      });
    });
    ctx.body = projects;
  } catch (e) {
    if (e.errorCode === 100) {
      ctx.body = [];
    } else throw e;
  }
});

/**
 * 获取项目详细信息
 */
router.get('/:project', async function (ctx) {
  try {
    const projectKey = path.join('/', ctx.config.namespace, ctx.params.project);
    const result = await ctx.etcd.get(projectKey);
    const nodes = result.node.nodes;
    const profiles = [];
    for (let i = 0; i < nodes.length; i += 1) {
      const profileName = nodes[i].key.substr(projectKey.length + 1);
      const profileKey = path.join(projectKey, profileName);
      profiles.push({
        name: profileName,
        currentVersion: Number((await ctx.etcd.get(path.join(profileKey, 'version'))).node.value),
      });
    }
    ctx.body = profiles;
  } catch (e) {
    throw e;
  }
});

/**
 * 获取项目profile版本
 */
router.get('/:project/:profile/versions', async function (ctx) {
  const projectKey = path.join('/', ctx.config.namespace, ctx.params.project);
  const profileName = ctx.params.profile;
  const profileKey = path.join(projectKey, profileName);
  const versions = [];
  const versionsKey = path.join(profileKey, 'versions');
  const versionNodes = (await ctx.etcd.get(versionsKey)).node.nodes;
  versionNodes.forEach((node) => {
    versions.push(Number(node.key.substr(versionsKey.length + 1)));
  });
  ctx.body = versions;
});

/**
 * 获取项目的conf
 */
router.get('/:project/:profile/versions/:version/conf', async function (ctx) {
  const rootKey = path.join('/', ctx.config.namespace, ctx.params.project, ctx.params.profile, 'versions', ctx.params.version, '');
  const nodes = (await ctx.etcd.get(rootKey, {
    recursive: true,
  })).node;

  function parse(result) {
    if (!result.dir) {
      return {
        key: result.key.substr(rootKey.length),
        value: result.value,
        dir: false,
      };
    }

    const nodes = [];
    result.nodes.forEach((node) => {
      nodes.push(parse(node));
    });
    return {
      key: result.key.substr(rootKey.length),
      dir: true,
      nodes: nodes,
    };
  }

  const data = parse(nodes);
  data.key = '/';
  ctx.body = data;
});

/**
 * 获取项目的key
 */
router.get('/:project/:profile/versions/:version/root:path(.*)', async function (ctx) {
  const rootKey = path.join('/', ctx.config.namespace, ctx.params.project, ctx.params.profile, 'versions', ctx.params.version, ctx.params.path);
  const nodes = (await ctx.etcd.get(rootKey)).node.nodes;
  const dirs = [];
  const files = [];
  nodes.forEach((node) => {
    const nameParts = node.key.split('/');
    const name = nameParts[nameParts.length - 1];
    if (node.dir) {
      dirs.push({
        name: name,
      });
    } else {
      files.push({
        name: name,
      });
    }
  });
  ctx.body = {
    dirs: dirs,
    files: files,
  };
});

/**
 * 复制一个新版本
 */
router.post('/:project/:profile/versions/:version/copy', async function (ctx) {
  const rootKey = path.join('/', ctx.config.namespace, ctx.params.project, ctx.params.profile, 'versions', ctx.params.version, '');
  const nodes = (await ctx.etcd.get(rootKey, {
    recursive: true,
  })).node;

  /**
   * 解析conf文件
   * @type {Array}
   */
  const files = [];

  function copy(result) {
    if (!result.dir) {
      files.push({
        key: result.key.substr(rootKey.length),
        value: result.value,
      });
      return;
    }
    result.nodes.forEach((node) => {
      copy(node);
    });
  }

  copy(nodes);

  /**
   * 获取最大版本号
   * @type {*}
   */
  const versionsKey = path.join('/', ctx.config.namespace, ctx.params.project, ctx.params.profile, 'versions');
  const versions = [];
  let maxVersion = 0;
  const versionNodes = (await ctx.etcd.get(versionsKey)).node.nodes;
  versionNodes.forEach((node) => {
    const tempVersion = Number(node.key.substr(versionsKey.length + 1));
    if (maxVersion < tempVersion) {
      maxVersion = tempVersion;
    }
  });
  maxVersion += 1;
  const newRootKey = path.join('/', ctx.config.namespace, ctx.params.project, ctx.params.profile, 'versions', maxVersion + '');
  files.forEach(node => {
    ctx.etcd.set(newRootKey + node.key, node.value);
  });
  ctx.body = maxVersion;
});

/**
 * 设置文件
 */
router.post('/:project/:profile/versions/:version', async function (ctx) {
  const body = ctx.request.body;
  const rootKey = path.join('/', ctx.config.namespace, ctx.params.project, ctx.params.profile, 'versions', ctx.params.version, '');
  body.data.forEach(node => {
    ctx.etcd.set(rootKey + node.key, node.value);
  });
  ctx.body = 'success';
});
/**
 * 删除文件
 */
router.del('/:project/:profile/versions/:version', async function (ctx) {
  const body = ctx.request.body;
  const rootKey = path.join('/', ctx.config.namespace, ctx.params.project, ctx.params.profile, 'versions', ctx.params.version, '');
  body.data.forEach(node => {
    ctx.etcd.remove(rootKey + node.key);
  });
  ctx.body = 'success';
});

