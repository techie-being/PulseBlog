

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

export {paginateQuery}