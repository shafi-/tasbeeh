export default class Tasbeeh {
    id?: number;

    title = '';

    text = '';

    repeatCount = 100;

    static create(data: Partial<Tasbeeh>): Tasbeeh {
        const tasbeeh = new Tasbeeh();

        tasbeeh.id = data.id;
        tasbeeh.title = data.title || '';
        tasbeeh.text = data.text || '';
        tasbeeh.repeatCount = data.repeatCount || 100;

        return tasbeeh;
    }
}
