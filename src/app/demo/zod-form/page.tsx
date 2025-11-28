"use client";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DemoFormSchema = z.object({
  name: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效邮箱"),
});

type DemoFormValues = z.infer<typeof DemoFormSchema>;

export default function ZodFormPage() {
  const [values, setValues] = useState<DemoFormValues>({ name: "", email: "" });
  const [errors, setErrors] = useState<
    Partial<Record<keyof DemoFormValues, string>>
  >({});
  const [submitted, setSubmitted] = useState<DemoFormValues | null>(null);

  const handleChange =
    (field: keyof DemoFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        const result = DemoFormSchema.safeParse({
          ...values,
          [field]: e.target.value,
        });
        if (result.success) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        } else {
          const issue = result.error.issues.find((i) => i.path[0] === field);
          setErrors((prev) => ({ ...prev, [field]: issue?.message }));
        }
      }
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = DemoFormSchema.safeParse(values);
    if (!parsed.success) {
      const newErrors: Partial<Record<keyof DemoFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof DemoFormValues;
        newErrors[key] = issue.message;
      }
      setErrors(newErrors);
      setSubmitted(null);
      return;
    }
    setErrors({});
    setSubmitted(parsed.data);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Zod 表单校验示例</h1>
      <p className="text-sm text-muted-foreground">
        使用 zod 进行客户端校验，配合 shadcn/ui 输入组件。
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange("name")}
            aria-invalid={Boolean(errors.name) || undefined}
            placeholder="输入姓名"
          />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange("email")}
            aria-invalid={Boolean(errors.email) || undefined}
            placeholder="name@example.com"
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email}</p>
          ) : null}
        </div>
        <Button type="submit" variant="default" className="w-full">
          提交
        </Button>
      </form>
      {submitted ? (
        <div className="rounded-md border p-4 text-sm">
          <div className="font-medium">提交成功</div>
          <div className="mt-2">姓名：{submitted.name}</div>
          <div>邮箱：{submitted.email}</div>
        </div>
      ) : null}
    </div>
  );
}
