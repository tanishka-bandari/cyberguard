import Shield from "@mui/icons-material/Shield";

export function BrandMark() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-md bg-accent text-lg text-accent-fg">
        <Shield fontSize="inherit" />
      </span>
      CyberGuard
    </span>
  );
}
