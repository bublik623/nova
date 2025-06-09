import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed, reactive, Ref, readonly } from "vue";

// Import the composable to test
import { useSidebarOptionsSection } from "./useSidebarOptionsSection";

// Import types and the dependency to mock
import { useOptionsSection } from "../useOptionsSection";

// Mock the dependency (Pinia store hook)
vi.mock("../useOptionsSection", () => ({
  useOptionsSection: vi.fn(),
}));

describe("useSidebarOptionsSection", () => {
  // --- Test Setup Variables ---
  let experienceId: Ref<string>;
  let mockOptionsStore: Partial<ReturnType<typeof useOptionsSection>>;
  // Ref to simulate the state driving the validationErrors getter in the mock store
  let mockSourceErrorState: Ref<string[]>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Initialize input ref
    experienceId = ref("test-exp-123");

    // Initialize the ref simulating the source of validation errors
    mockSourceErrorState = ref<string[]>([]); // Start valid

    // Create the mock store object
    mockOptionsStore = reactive({
      // Mock validationErrors as a computed property (getter) reading from our source state
      validationErrors: computed(() => mockSourceErrorState.value),
      // Add any other properties from the store ONLY if they are used by
      // useSidebarOptionsSection (doesn't seem like it needs more)
    });

    // Configure the mock hook to return our simulated store
    // Use 'as any' to bypass complex Pinia Store type checking
    vi.mocked(useOptionsSection).mockReturnValue(mockOptionsStore as any);
  });

  // --- Tests ---
  it("should have the correct static structure and keys", () => {
    const sectionRef = useSidebarOptionsSection(readonly(experienceId));
    const section = sectionRef.value;

    expect(section.key).toBe("options");
    expect(section.isRequired).toBe(true);
    expect(section.icon).toBe("options");
    expect(section.showFields).toBe(false);
    expect(section.fields).toBeInstanceOf(Array);
    expect(section.fields.length).toBe(1);

    const field = section.fields[0];
    expect(field.key).toBe("options");
    expect(field.isRequired).toBe(false);
    expect(field.isHidden).toBe(false);
  });

  it("should generate the correct URL based on initial experienceId", () => {
    const sectionRef = useSidebarOptionsSection(readonly(experienceId));
    expect(sectionRef.value.url).toBe("/opinoia/test-exp-123/operational/options");
  });

  it("should update URL when experienceId changes", () => {
    const sectionRef = useSidebarOptionsSection(readonly(experienceId));
    // Initial check
    expect(sectionRef.value.url).toBe("/opinoia/test-exp-123/operational/options");

    // Act: Change the input ref
    experienceId.value = "new-exp-456";

    // Assert: Check if the computed value reflects the change
    expect(sectionRef.value.url).toBe("/opinoia/new-exp-456/operational/options");
  });

  it("should set isValid to true when validationErrors is empty", () => {
    // Arrange: Ensure source state is empty
    mockSourceErrorState.value = [];
    const sectionRef = useSidebarOptionsSection(readonly(experienceId));

    // Assert
    expect(sectionRef.value.isValid).toBe(true);
    expect(sectionRef.value.fields[0].isValid).toBe(true);
  });

  it("should set isValid to false when validationErrors is not empty", () => {
    // Arrange: Set source state to have errors
    mockSourceErrorState.value = ["Error 1"];
    const sectionRef = useSidebarOptionsSection(readonly(experienceId));

    // Assert
    expect(sectionRef.value.isValid).toBe(false);
    expect(sectionRef.value.fields[0].isValid).toBe(false);
  });

  it("should reactively update isValid when validationErrors change (empty to non-empty)", () => {
    // Arrange: Start valid
    mockSourceErrorState.value = [];
    const sectionRef = useSidebarOptionsSection(readonly(experienceId));
    expect(sectionRef.value.isValid).toBe(true); // Initial check

    // Act: Introduce errors by changing the source state
    mockSourceErrorState.value = ["New Error"];

    // Assert: Check if the computed value reacted
    expect(sectionRef.value.isValid).toBe(false);
    expect(sectionRef.value.fields[0].isValid).toBe(false);
  });

  it("should reactively update isValid when validationErrors change (non-empty to empty)", () => {
    // Arrange: Start invalid
    mockSourceErrorState.value = ["Old Error"];
    const sectionRef = useSidebarOptionsSection(readonly(experienceId));
    expect(sectionRef.value.isValid).toBe(false); // Initial check

    // Act: Remove errors by changing the source state
    mockSourceErrorState.value = [];

    // Assert: Check if the computed value reacted
    expect(sectionRef.value.isValid).toBe(true);
    expect(sectionRef.value.fields[0].isValid).toBe(true);
  });
});
