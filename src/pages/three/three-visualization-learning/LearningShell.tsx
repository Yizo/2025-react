import { Empty, Typography } from 'antd';

type LearningShellProps = {
  title: string;
  description: string;
};

export default function LearningShell({ title, description }: LearningShellProps) {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
      <Empty
        description={
          <div className="space-y-2">
            <Typography.Text strong className="text-slate-800">
              {title}
            </Typography.Text>
            <Typography.Paragraph type="secondary" className="mb-0!">
              {description}
            </Typography.Paragraph>
          </div>
        }
      />
    </div>
  );
}
