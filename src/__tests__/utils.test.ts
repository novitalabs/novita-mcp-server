import { clearSensitiveInfo } from '../utils'

describe('clearSensitiveInfo', () => {
    it('should remove sshPassword from instances', () => {
        const testData = {
            instances: [
                {
                    id: '1',
                    name: 'instance1',
                    sshPassword: 'secret123'
                },
                {
                    id: '2',
                    name: 'instance2',
                    sshPassword: 'secret456'
                }
            ]
        };

        clearSensitiveInfo(testData);

        expect(testData.instances[0].sshPassword).toBeUndefined();
        expect(testData.instances[1].sshPassword).toBeUndefined();
        expect(testData.instances[0].id).toBe('1');
        expect(testData.instances[1].id).toBe('2');
    });

    it('should handle empty instances array', () => {
        const testData = {
            instances: []
        };

        clearSensitiveInfo(testData);

        expect(testData.instances).toEqual([]);
    });

    it('should handle null data', () => {
        const testData = null;
        clearSensitiveInfo(testData);
        expect(testData).toBeNull();
    });

    it('should handle data without instances', () => {
        const testData = { otherField: 'value' };
        clearSensitiveInfo(testData);
        expect(testData).toEqual({ otherField: 'value' });
    });
});
