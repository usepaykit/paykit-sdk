import { createTsupConfig } from '../../tsup.config.base';

// React package might need external dependencies
export default createTsupConfig({
  external: ['react', 'react-dom'],
});

