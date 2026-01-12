import { ArticleJsonLd, CourseJsonLd, FAQPageJsonLd, EventJsonLd, ProductJsonLd } from 'next-seo';

interface ArticleSchemaProps {
    url: string;
    title: string;
    images: string[];
    datePublished: string;
    dateModified?: string;
    authorName: string;
    description: string;
}

export const ArticleSchema = ({
    url,
    title,
    images,
    datePublished,
    dateModified,
    authorName,
    description,
}: ArticleSchemaProps) => (
    <ArticleJsonLd
        url={url}
        title={title}
        images={images}
        datePublished={datePublished}
        dateModified={dateModified || datePublished}
        authorName={[
            {
                name: authorName,
                url: 'https://www.gr8er.live',
            },
        ]}
        publisherName="GR8ER IB"
        publisherLogo="https://www.gr8er.live/images/gr8er_logo.png"
        description={description}
    />
);

interface FAQSchemaProps {
    mainEntity: {
        questionName: string;
        acceptedAnswerText: string;
    }[];
}

export const FAQSchema = ({ mainEntity }: FAQSchemaProps) => (
    <FAQPageJsonLd mainEntity={mainEntity} />
);

interface CourseSchemaProps {
    courseName: string;
    description: string;
    provider: {
        name: string;
        url: string;
    };
}

export const CourseSchema = ({ courseName, description, provider }: CourseSchemaProps) => (
    <CourseJsonLd
        courseName={courseName}
        description={description}
        provider={{
            name: provider.name,
            url: provider.url,
            type: 'Organization'
        }}
    />
);

interface ProductSchemaProps {
    name: string;
    description: string;
    image: string[];
    price: number;
    currency: string;
}

export const ProductSchema = ({ name, description, image, price, currency }: ProductSchemaProps) => (
    <ProductJsonLd
        productName={name}
        description={description}
        images={image}
        offers={[
            {
                price: price.toFixed(2),
                priceCurrency: currency,
                availability: 'https://schema.org/InStock',
                url: 'https://www.gr8er.live',
                seller: {
                    name: 'GR8ER IB'
                }
            }
        ]}
    />
);
