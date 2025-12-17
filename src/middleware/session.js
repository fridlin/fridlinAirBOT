module.exports = function session() {
  const store = new Map();

  return async (ctx, next) => {
    const id = ctx.from?.id;
    if (!id) return next();

    if (!store.has(id)) store.set(id, {});
    ctx.session = store.get(id);

    await next();
  };
};
