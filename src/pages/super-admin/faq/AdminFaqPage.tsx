import { useState, useMemo } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button, Modal, Form, Input, Spin } from "antd";
import { toast } from "sonner";
import {
  PageHeader,
  Panel,
  EmptyState,
  DeleteConfirmModal,
} from "@/components/ui";
import {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  type ApiFaq,
} from "@/store/api/faqApi";
import { getApiErrorMessage } from "@/lib/api-error";
import { timeAgo, formatDateShort } from "@/lib/utils";

export default function AdminFaqPage() {
  const { data: faqs = [], isLoading } = useGetFaqsQuery();
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ApiFaq | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<ApiFaq | null>(null);

  const [form] = Form.useForm();

  // Filter FAQs by question or answer
  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q),
    );
  }, [faqs, search]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFaqs.map((f) => f._id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const openCreate = () => {
    setEditingFaq(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (faq: ApiFaq) => {
    setEditingFaq(faq);
    form.setFieldsValue({
      question: faq.question,
      answer: faq.answer,
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        question: values.question.trim(),
        answer: values.answer.trim(),
      };

      if (editingFaq) {
        await updateFaq({ id: editingFaq._id, data: payload }).unwrap();
        toast.success("FAQ updated successfully.");
      } else {
        await createFaq(payload).unwrap();
        toast.success("FAQ created successfully.");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingFaq(null);
    } catch (err: any) {
      if (err?.errorFields) return; // Ant Design form validation error
      toast.error(getApiErrorMessage(err, "Failed to save FAQ."));
    }
  };

  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;
    try {
      await deleteFaq(faqToDelete._id).unwrap();
      toast.success("FAQ deleted successfully.");
      setFaqToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete FAQ."));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Platform"
        title="Frequently asked questions"
        description="Manage global FAQs displayed across the SHOWE platform and mobile apps."
        actions={
          <Button type="primary" icon={<Plus size={14} />} onClick={openCreate}>
            Add FAQ
          </Button>
        }
      />

      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative max-w-sm w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs by question or answer…"
            className="input-base !h-10 pl-10"
          />
        </div>

        {filteredFaqs.length > 0 && (
          <div className="flex items-center gap-2">
            <Button size="small" onClick={expandAll}>
              Expand all
            </Button>
            <Button size="small" onClick={collapseAll}>
              Collapse all
            </Button>
          </div>
        )}
      </div>

      {/* FAQ Items List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : faqs.length === 0 ? (
        <Panel>
          <EmptyState
            icon={HelpCircle}
            title="No FAQs yet"
            description="Create helpful answers to common audience and venue questions."
            action={
              <Button
                type="primary"
                icon={<Plus size={14} />}
                onClick={openCreate}
              >
                Create first FAQ
              </Button>
            }
          />
        </Panel>
      ) : filteredFaqs.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Search}
            title="No matching FAQs"
            description={`No questions match "${search}". Try searching with different keywords.`}
            action={<Button onClick={() => setSearch("")}>Clear search</Button>}
          />
        </Panel>
      ) : (
        <div className="space-y-3.5">
          {filteredFaqs.map((faq, index) => {
            const isExpanded = expandedIds.has(faq._id);
            return (
              <div
                key={faq._id}
                className="group rounded-2xl border border-line/80 bg-surface-raised transition-all duration-200 shadow-soft hover:shadow-medium hover:border-line"
              >
                <div
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(faq._id)}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold font-display mt-0.5">
                      Q{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-base text-ink leading-snug group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      {!isExpanded && (
                        <p className="text-sm text-ink-muted line-clamp-1 mt-1 font-normal">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => openEdit(faq)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-primary hover:bg-surface-sunken transition-colors"
                      title="Edit FAQ"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqToDelete(faq)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(faq._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint hover:text-ink transition-transform duration-200"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180 text-primary" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-line/50 animate-fade-in">
                    <div className="p-4 rounded-xl bg-surface-sunken/60 text-ink leading-relaxed text-[14.5px] whitespace-pre-wrap">
                      {faq.answer}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-ink-faint mt-3 px-1">
                      <div className="flex items-center gap-3">
                        {faq.createdAt && (
                          <span>Created {formatDateShort(faq.createdAt)}</span>
                        )}
                        {faq.updatedAt && (
                          <span>· Updated {timeAgo(faq.updatedAt)}</span>
                        )}
                      </div>
                      <span className="font-mono text-[10.5px] text-ink-faint/70">
                        ID: {faq._id}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editingFaq ? "Edit FAQ" : "Create new FAQ"}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingFaq(null);
        }}
        footer={
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              onClick={() => {
                setModalOpen(false);
                form.resetFields();
                setEditingFaq(null);
              }}
              disabled={isCreating || isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={isCreating || isUpdating}
              onClick={handleModalSubmit}
            >
              {editingFaq ? "Save changes" : "Create FAQ"}
            </Button>
          </div>
        }
        centered
        width={560}
        className="premium-modal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="question"
            label={<span className="field-label !mb-1">Question</span>}
            rules={[
              { required: true, message: "Please enter a question." },
              { min: 5, message: "Question must be at least 5 characters." },
            ]}
          >
            <Input
              placeholder="e.g. What is SHOWE and how does it work?"
              className="input-base"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="answer"
            label={<span className="field-label !mb-1">Answer</span>}
            rules={[
              { required: true, message: "Please enter an answer." },
              { min: 10, message: "Answer must be at least 10 characters." },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Enter the comprehensive answer that will be shown to users..."
              className="input-base !h-auto py-3"
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(faqToDelete)}
        onCancel={() => setFaqToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Delete this FAQ?"
        description="This question and answer will be permanently removed from all apps."
        targetName={faqToDelete?.question}
        confirmText="Delete FAQ"
      />
    </div>
  );
}
