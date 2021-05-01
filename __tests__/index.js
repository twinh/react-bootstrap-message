import api from '../js/react-bootstrap-message';

describe('message', () => {
  test('basic', async () => {
    const result = await api.success('test');
    expect(result).toBeTruthy();
  });
});

