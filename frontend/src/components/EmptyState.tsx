import Link from "next/link";

export function EmptyState({
  title,
  body,
  href,
  action,
  image,
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
  image?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] bg-white shadow-sm">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-44 w-full object-cover" />
      ) : null}
      <div className="px-8 py-10 text-center">
        <h2 className="font-display text-2xl text-navy">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-navy/65">{body}</p>
        {href && action ? (
          <Link href={href} className="btn-primary mt-6 inline-flex">
            {action}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
