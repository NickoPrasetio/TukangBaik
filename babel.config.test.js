module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    // Strip Next.js directives like 'use client' / 'use server'
    function stripNextDirectives() {
      return {
        visitor: {
          ExpressionStatement(path) {
            if (
              path.node.expression.type === 'StringLiteral' &&
              (path.node.expression.value === 'use client' ||
                path.node.expression.value === 'use server')
            ) {
              path.remove();
            }
          },
        },
      };
    },
  ],
};
