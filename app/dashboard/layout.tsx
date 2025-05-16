import {Toaster} from "@/components/ui/toaster";

export default function DashboardLayout({
                                            children,
                                        }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <meta content="width=device-width, initial-scale=1, user-scalable=no"/>
        </head>
        <body>
        <main>{children}</main>
        <Toaster/>
        </body>
        </html>
    );
}
