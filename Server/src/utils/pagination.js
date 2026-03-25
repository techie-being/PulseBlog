

const paginateQuery = async (model,filter={},page=1,limit=10,options={}) => {
    const pageNum = Math.max(1,Number(page));
    const limitNum = Math.max(1,Number(limit));
    const skip = (pageNum-1) * limitNum;

    const [data,totalItems] = await Promise.all(
        [
            model.find(filter)
            .sort(options.sort || { createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate(options.populate || "")
            .select(options.select || ""),
            model.countDocuments(filter)
        ]
    )

    const totalPages = Math.ceil(totalItems / limitNum);

    return {
        data,
        pagination: {
            totalItems,
            totalPages,
            currentPage: pageNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    }
}

const paginateAggregate = async (model, pipeline = [], page = 1, limit = 10) => {
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    // We use $facet to get both total count and paginated data in ONE database hit
    const aggregatePipeline = [
        ...pipeline,
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: limitNum }]
            }
        }
    ];

    const result = await model.aggregate(aggregatePipeline);
    
    const totalItems = result[0]?.metadata[0]?.total || 0;
    const data = result[0]?.data || [];
    const totalPages = Math.ceil(totalItems / limitNum);

    return {
        data,
        pagination: {
            totalItems,
            totalPages,
            currentPage: pageNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    };
};


export {
    paginateQuery,
    paginateAggregate

}