import Button from '../Button';

export default {
  title: 'Button',
  component: Button,
};

export const WithText = () => <Button>Hello Button</Button>;

WithText.storyName = 'with text';

export const WithSomeEmoji = () => (
  <Button>
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </Button>
);

WithSomeEmoji.storyName = 'with some emoji';
